import axios from 'axios';
import React, { useState } from 'react'
import swal from 'sweetalert';
export default function DeleteApprovalTbody(props) {
    const [atype, setatype] = useState('');
    const [appAdmin, setappAdmin] = useState('');
    const [id, setid] = useState('');
    const approveDeleteTransaction = (e) =>{
        e.preventDefault();
        // alert(`${atype},${appAdmin},${id}`)
        let sign ='';
        if(atype == 'approve'){
            sign=`${props.userDetails.id}_${props.userDetails.name}`;
        }else{
            sign='rejected';
        }
        axios.post(`${props.baseURL}/deletetranscationupdate`, {
            cid: props.userDetails.cid,
            sign:sign,
            trans_id:id,
            admin:appAdmin,
        })
            .then((response) => {
                swal(response.data[0],"",response.data[1]);
            });
    };
    const setValues=(e) =>{
        setatype(e.target.attributes.getNamedItem('atype').value);
        setappAdmin(e.target.attributes.getNamedItem('admin').value);
        setid(e.target.value);
       
    }
  return (
    
        props.data[0].map((data,i)=>{
            return <tr key={i}>
                <td>{i+1}</td>
                <td>{data.usn}</td>
                <td>{data.name}</td>
                <td>{data.trans_id}</td>
                <td>{props.formatDate('',data.paid_date)}</td>
                <td>{data.scr_no}</td>
                <td>{props.numberWithCommas(data.pait_amt)}</td>
                { props.data[1]['admin'] == 1 ? <td><form onSubmit={approveDeleteTransaction}><button type="submit" className="btn btn-success rounded mb-2" admin={props.data[1]['admin']} value={data.trans_id} atype="approve" data-id='g' onClick={(e)=> setValues(e) }>Approve</button><button type="submit" className="btn btn-danger rounded" admin={props.data[1]['admin']} value={data.trans_id} atype="rejected" data-id='g' onClick={(e)=> setValues(e) }>Rejected</button></form></td> : <><td>{data.admin1}</td><td><form onSubmit={approveDeleteTransaction}><button type="submit" className="btn btn-success rounded mb-2" admin={props.data[1]['admin']} value={data.trans_id} atype="approve" data-id='g' onClick={(e)=> setValues(e) }>Approve</button><button type="submit" className="btn btn-danger rounded" admin={props.data[1]['admin']} value={data.trans_id} atype="rejected" data-id='g' onClick={(e)=> setValues(e) }>Rejected</button></form></td></> }
            </tr>
        })
    
  )
}
