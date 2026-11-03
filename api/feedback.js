import {guard,sb} from './_shared.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!guard(req,res))return;
 if(req.method!=='POST')return res.status(405).end();
 try{
  const {candidate_id,feedback}=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(!/^[a-f0-9-]{36}$/i.test(candidate_id||'')||typeof feedback!=='string'||!feedback.trim()||feedback.length>4000)return res.status(400).json({error:'Invalid feedback'});
  const matches=await sb('recruiting_candidates?select=id&id=eq.'+candidate_id+'&limit=1');
  if(!matches.length)return res.status(404).json({error:'Candidate not found'});
  const rows=await sb('recruiting_candidate_feedback',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({candidate_id,feedback:feedback.trim()})});
  return res.status(201).json(rows[0]);
 }catch(e){return res.status(500).json({error:'Could not save feedback'})}
}