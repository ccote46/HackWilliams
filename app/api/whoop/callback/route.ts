import { NextRequest, NextResponse } from "next/server";


//once the user accepts authentication they are sent here
export async function GET(req: NextRequest){
    //look thru returned url and grab code and state (and error if there is one)
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");


    if(error){
        return NextResponse.redirect(`${req.nextUrl.origin}?error=${error}`);
    }

    const savedState = req.cookies.get("whoop_oauth_state")?.value;

    //first we have to make sure our saved state matches the state of the request
    //prevent against csrf 
    if(!state || state !== savedState || !code){
        return NextResponse.json({ error: "Invalid Request"}, { status: 400});
    }

    try{
        //next we get an accesstoken from the code so we can access user data
        const getToken = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: process.env.WHOOP_CLIENT_ID!,
                client_secret: process.env.WHOOP_CLIENT_SECRET!,
                redirect_uri: process.env.WHOOP_REDIRECT_URI!,
            }),
        });

        const tokens = await getToken.json();
        if(!getToken.ok){
            return NextResponse.json({ error: "Couldn't get token! "}, { status: 400 });
        }

        //if we get a token, send it to frontend & delete oauth cookie, and store new token in a cookie
        const response = NextResponse.redirect(`${req.nextUrl.origin}?authenticated=true`);
        response.cookies.delete("whoop_oauth_state");
        response.cookies.set("whoop_access_token", tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: tokens.expires_in || 3600,
        });

        if(tokens.refresh_token){
            response.cookies.set("whoop_refresh_token", tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30,
            });
        }

        return response;
    }
    catch (error){
        console.error("OAuth error: ", error);
        return NextResponse.json({ error: "OAuth Failed"}, { status: 500 });
    }

}