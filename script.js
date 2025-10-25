// frontend logic (calls same-host API endpoints)
function $(id){return document.getElementById(id)}
const TOLINK = "https://t.me/+karanbannaa108";
function initLoginPage(){
  const signin = $("signin"), getUid = $("getUid"), forgot = $("forgot"), changepwd = $("changepwd"), status = $("status");
  $("password").value = "";
  signin.onclick = async ()=>{
    const uid = $("uid").value.trim(); const pwd = $("password").value;
    if(!/^\d{10}$/.test(uid)){ status.textContent = "UID must be 10 digits."; return; }
    const key = "mw_user_"+uid; const stored = localStorage.getItem(key); const pwdToCheck = stored?JSON.parse(stored).password:"World@1234";
    if(pwd===pwdToCheck){ sessionStorage.setItem("mw_session", uid); location = "/dashboard.html"; }
    else status.textContent = "Invalid UID or password.";
  };
  getUid.onclick = async ()=>{
    const uidInput = $("uid").value.trim() || ("guest_"+Date.now());
    status.textContent = "Requesting UID... Open Telegram when prompted.";
    try{
      const resp = await fetch('https://d88ac112-4ffe-4def-afbe-3fd4f1bb177b-00-3gwrnifo1kicx.sisko.replit.dev/api/uid/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: uidInput })
});
      const data = await resp.json();
      window.open(data.telegramLink, '_blank');
      // poll status
      const start = Date.now(), timeout=60000;
      const iv = setInterval(async ()=>{
        const s = await fetch('/api/uid/status?requestId='+data.requestId);
        const sd = await s.json();
        if(sd.status==='done' && sd.uid){ clearInterval(iv); status.textContent = 'Assigned UID: '+sd.uid; $("uid").value = sd.uid; localStorage.setItem('mw_user_'+sd.uid, JSON.stringify({password:'World@1234'})); }
        if(Date.now()-start>timeout){ clearInterval(iv); status.textContent = 'Timeout waiting for UID. Check Telegram.'; }
      },2000);
    }catch(e){ status.textContent = 'Error: '+e.message }
  };
  forgot.onclick = async ()=>{
    const uid = $("uid").value.trim(); if(!/^\d{10}$/.test(uid)){ status.textContent='Enter your UID first.'; return; }
    // request pwd reset from server (link to bot)
    try{
      const resp = await fetch('https://d88ac112-4ffe-4def-afbe-3fd4f1bb177b-00-3gwrnifo1kicx.sisko.replit.dev/api/pwd/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
});
      const d = await resp.json();
      window.open(d.telegramLink,'_blank');
      status.textContent = 'Opened Telegram. Follow bot instructions to set new password.';
    }catch(e){ status.textContent='Error: '+e.message }
  };
  changepwd.onclick = ()=>{
    const uid = $("uid").value.trim(); if(!/^\d{10}$/.test(uid)){ status.textContent='Enter your UID first.'; return; }
    const newPwd = prompt('Enter new password (min 6 chars):',''); if(!newPwd||newPwd.length<6){ alert('Password too short'); return; }
    localStorage.setItem('mw_user_'+uid, JSON.stringify({password:newPwd})); alert('Password changed locally. Use it to sign in.'); };
}
function initDashboard(){ const uid=sessionStorage.getItem('mw_session'); if(!uid) location='/'; $('showUid')&&($('showUid').textContent='UID: '+uid); $('acctUid')&&($('acctUid').textContent=uid); const stored=localStorage.getItem('mw_user_'+uid); $('acctPwd')&&($('acctPwd').textContent= stored? JSON.parse(stored).password:'World@1234'); $('play')&&($('play').onclick=()=>alert('Launcher: Game build coming soon!')); $('logout')&&($('logout').onclick=()=>{ sessionStorage.removeItem('mw_session'); location='/'; }); }
document.addEventListener('DOMContentLoaded', ()=>{ if(document.getElementById('loginForm')) initLoginPage(); if(document.querySelector('.dash-wrap')) initDashboard(); });
