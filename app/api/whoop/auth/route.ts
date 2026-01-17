import { NextResponse } from "next/server";
import { randomBytes } from "crypto";


//redirect user to whoop's login authentication 
export async function GET(){
    const { WHOOP_CLIENT_ID: clientId, WHOOP_REDIRECT_URI: redirectUri} = process.env;

    //makesure our id and our returnpoint pass correctly
    if(!clientId || !redirectUri){
        return NextResponse.json({ error: "Missing Dev Whoop Credentials (incorrect uri/clientid)" }, { status: 500 });
    }

    //whoop needs 16 bit random str to be passed on every oauth to prevent csrf
    const state = randomBytes(16).toString('hex');


    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "read:recovery read:sleep read:workout read:cycles read:profile",
        state,
    });

    const response = NextResponse.redirect(`https://api.prod.whoop.com/oauth/oauth2/auth?${params}`);
    
    //store state -- ensure oauth comes from us
    response.cookies.set("whoop_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
    });

    return response
}