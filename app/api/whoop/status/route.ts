import { NextRequest, NextResponse } from "next/server";

const WHOOP_API = "https://api.prod.whoop.com/developer/v2";

//once user is properly authenticated, we get to send their profile data out
export async function GET(req:NextRequest) {
    const token = req.cookies.get("whoop_access_token")?.value;

    if(!token){
        return NextResponse.json({ authenticated: false });
    }

    try{
        const res = await fetch(`${WHOOP_API}/user/profile/basic`, {
            headers: { Authorization: `Bearer ${token}`},
        });

        if(!res.ok){
            return NextResponse.json({ authenticated : false});
        }

        const profile = await res.json();
        return NextResponse.json({
            authenticated: true,
            user: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                email: profile.email,
            },
        });
    }
    catch(error){
        return NextResponse.json({ authenticated: false});
    }
    
}