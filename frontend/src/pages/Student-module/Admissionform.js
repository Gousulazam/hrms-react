import React from 'react'
import Beadmissionform from './Beadmissionform'

const Admissionform = (props) => {

  return (
    <div>
      <div className="card">
        <div className="default-tab">
          <nav>
            <div className="nav nav-tabs nav-justified" id="nav-tab" role="tablist">

              <a className="nav-item nav-link active show" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">BE Admission Form</a>
              <a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Lateral Entry Admission Form</a>
              <a className="nav-item nav-link" id="nav-profile-tab1" data-toggle="tab" href="#nav-profile1" role="tab" aria-controls="nav-profile" aria-selected="false">Change of College Admission Form</a>
            </div>
          </nav>
          <div className="tab-content pl-3 pt-2"  id="nav-tabContent">
            <div className="tab-pane fade active show"  id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
              <Beadmissionform baseURL={props.baseURL} userDetails={props.userDetails}/>
            </div>
            <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">

            </div>
            <div className="tab-pane fade" id="nav-profile1" role="tabpanel" aria-labelledby="nav-profile-tab">

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admissionform
