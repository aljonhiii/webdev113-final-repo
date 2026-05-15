window.onload=function(){
loadSettledRecords();
}

function logout(){
window.location.href='../login/login.html';
}

function loadSettledRecords(){
const table=document.getElementById('archiveTableBody');

let data=JSON.parse(localStorage.getItem('barangayReports'))||[];

let records=data.filter(r=>r.status==='Settled'||r.status==='Failed');

if(records.length===0){
table.innerHTML='<tr><td colspan="6">No archived records</td></tr>';
return;
}

table.innerHTML='';

records.reverse().forEach(r=>{

let cls=r.status==='Settled'?'green':'red';
let text=r.status==='Settled'?'Settled Successfully':'Failed Mediation';

table.innerHTML+=`
<tr>
<td><strong>${r.reportID||'REF-001'}</strong></td>
<td>${r.complainantName||'Juan Dela Cruz'}</td>
<td>${r.respondentName||'Pedro Santos'}</td>
<td>${r.category||'Complaint'}</td>
<td><span class="status ${cls}">${text}</span></td>
<td class="right">
<button class="view-btn" onclick="openModal('${r.reportID}')">View Record</button>
</td>
</tr>
`;
});
}

function openModal(id){

let data=JSON.parse(localStorage.getItem('barangayReports'))||[];
let r=data.find(x=>x.reportID==id);

if(!r)return;

document.getElementById('modalId').innerText=id;
document.getElementById('mComplainant').innerText=r.complainantName||'N/A';
document.getElementById('mRespondent').innerText=r.respondentName||'N/A';
document.getElementById('mDesc').innerText=r.description||'No description';

document.getElementById('mNotes').innerText=r.discussionNotes||'None';
document.getElementById('mWitness').innerText=r.witnessStatements||'None';
document.getElementById('mDecision').innerText=r.hearing1Decision||'None';

document.getElementById('mFinal').innerText=r.decisionNotes||'No final decision';

let status=document.getElementById('modalStatus');

if(r.status==='Settled'){
status.innerText='Settled';
status.className='status-badge green';
}else{
status.innerText='Failed';
status.className='status-badge red';
}

let modal=document.getElementById('modal');
modal.classList.remove('hidden');
setTimeout(()=>modal.classList.add('show'),10);
}

function closeModal(){
let modal=document.getElementById('modal');
modal.classList.remove('show');
setTimeout(()=>modal.classList.add('hidden'),150);
}
