import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { chatPrompt } from "./prompt";

//intialize openai
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//store whoop api url
const WHOOP_API = "https://api.prod.whoop.com/developer/v2";

//takes oauth token, returns object w all users biometric data
async function getWhoopData(token: string) {
    const headers = { Authorization: `Bearer ${token}`};
    //get last 7 days of data
    const end = new Date().toISOString();
    const start = new Date(Date.now() - 7 * 864e5).toISOString();
    
    //fetch all data, if not 200 ret null
    const [profile, recovery, sleep, strain, workout] = await Promise.allSettled([
        fetch(`${WHOOP_API}/user/profile/basic`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${WHOOP_API}/recovery?start=${start}&end=${end}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${WHOOP_API}/activity/sleep?start=${start}&end=${end}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${WHOOP_API}/activity/strain?start=${start}&end=${end}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${WHOOP_API}/activity/workout?start=${start}&end=${end}`, { headers }).then(r => r.ok ? r.json() : null),
    ]);

    //ret all data as an array -- if one doesnt work can still get others
    return {
        profile : profile.status === "fulfilled" ? profile.value : null,
        recovery : recovery.status === "fulfilled" ? recovery.value?.records ?? [] : [],
        sleep : sleep.status === "fulfilled" ? sleep.value?.records ?? [] : [],
        strain : strain.status === "fulfilled" ? strain.value?.records ?? [] : [],
        workout : workout.status === "fulfilled" ? workout.value?.records ?? [] : [],
    };
}

//format raw WHOOP data for something readable & usable by our ai agent
function formatData(data: any) {
    //if no profile
    if(!data?.profile) return "\n WHOOP not connected";

    let biometrics = `
    \n WHOOP DATA \n
    Athlete: ${data.profile.first_name} ${data.profile.last_name} \n`

    //prase data and return it readably (return last 5 of each to not overwhelm agent w/ not important data)
    //output ex: Recovery on Tue Jan 16 2026: 85% | HRV 55ms | RHR 48bpm
    biometrics += `
    === RECOVERY === `
    data.recovery.slice(0,5).forEach((r: any) => {
        biometrics += `\n Recovery on ${new Date(r.created_at).toDateString()}: ${r.score?.recovery_score ?? "N/A"}% | HRV ${r.score?.hrv_rmssd_milli ?? "N/A"}ms | 
        RHR ${r.score?.resting_heart_rate ?? "N/A"}bpm\n`;
    });

    biometrics += `
    === STRAIN ===`
    data.strain.slice(0,5).forEach((s: any) => {
        biometrics += `\n Strain on ${new Date(s.created_at).toDateString()}: ${s.score?.strain ?? "N/A"}\n`;
    });

    biometrics += `
    === SLEEP ===`
    data.sleep.slice(0,5).forEach((s: any) => {
        biometrics += `\n Sleep Performance on ${new Date(s.start).toDateString()}: ${s.score?.sleep_performance_percentage ?? "N/A"}% | 
        Total sleep time: ${s.score?.total_sleep_time_milli 
            ? Math.round(s.score.total_sleep_time_milli / 36e5)
            : "N/A"} hours | 
        Efficiency: ${s.score?.sleep_efficiency_percentage ?? "N/A"}% \n`;
    });

    biometrics += `
    === WORKOUTS ===`
    data.workout.slice(0,5).forEach((w: any) => {
        biometrics += `\n Workouts on ${new Date(w.start).toDateString()}: ${w.sport_name} | Strain: ${w.score?.strain ?? "N/A"} | 
        Average HR: ${w.score?.average_heart_rate ?? "N/A"}bpm \n`;
    });

    return biometrics + "=== END OF DATA === \n";
}

export async function POST(req: NextRequest) {
    try {
        const { prompt, messages = []} = await req.json();
        if (!prompt) return NextResponse.json({ error: "Missing Prompt" }, { status: 400 });

        const token = req.cookies.get("whoop_access_token")?.value;
        const whoopData = token ? formatData(await getWhoopData(token)) : "\n WHOOP not connected";

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                //send prompt, whoop data, existing messages to agent for response
                {role: "system", content: chatPrompt + whoopData}, ...messages,
                {role: "user", content: prompt},
            ],
        });

        return NextResponse.json({ text:response.choices[0].message.content ?? "Sorry, I couldn't generate a response. Please try again"});
    }
    catch (error: any){
        console.error("API Error: ", error?.message);
        return NextResponse.json({ error: error?.message || "API Error"}, { status: 500 });
    }
}