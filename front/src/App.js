import React, { useState, useEffect, setValues } from 'react';
import Webcam from "react-webcam";
import { Container, Col, Button } from 'react-bootstrap';
import Axios from "axios";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

function App() {

  useEffect( () => {
    document.body.classList.add("bg-facebook");
    return () => {
      document.body.classList.remove("bg-facebook");
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const webcamRef = React.useRef(null);

  const capture = ( async () => {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      console.log("name: ", name)
      formData.append('image', blob, name)
      formData.append('image', blob, name)
      formData.append('image', blob, name)
      formData.append('image', blob, name)
      formData.append('image', blob, name)
      Axios.post("http://localhost:8000/register", formData)
        .then(response => {
          if (response.data.response == "save complete") {
            Axios.get("http://localhost:8000/build")
              .then(response => {
                if (response.data.response == "build complete") {
                  console.log("build is complete");
                  alert("build is complete")
                } else {
                  console.log("build is not working");
                }
              })
              .catch(err => {
                console.log("Build Server is not working");
              });
          } else {
            console.log("saving is not working");
          }
        })
        .catch(err => {
          console.log("Saving Server is not working: ", err)
        })
  });

  const test = ( async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();
    console.log("name: ", name)
    formData.append('image', blob, "test")
    Axios.post("http://localhost:8000/save", formData)
    .then(response => {
      if (response.data.response == "save complete") {
        Axios.get("http://localhost:8000/test")
          .then(response => {
            console.log(response)
            alert(response.data.response) 
          })
          .catch(err => {
            console.log("Build Server is not working");
          });
      } else {
        console.log("saving is not working");
      }
    })
    .catch(err => {
      console.log("Saving Server is not working: ", err)
    })
  });

  return (
    <>
      <div className="main-content">
        <div className="header bg-facebook pb-1 py-3 py-lg-6">
          <Container>
            <div className="header-body text-center">
              <h1 className="text-black">Capstone Design</h1>
            </div>
          </Container>
        </div>
        <div className="body bg-facebook pb-9">
          <Container className="mt-5 py-1 pb-4 text-center">
            <Col className="justify-content-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
            </Col>
          </Container>
          <Container className="pb-1 text-center">
            <Col className="justify-content-center">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
              />  
            </Col>
            <Col className="justify-content-center">  
              <Button className="mt-5 btn-primary" onClick={capture}>Register</Button>
              <Button className="mt-5 btn-light" onClick={test}>Test</Button>
            </Col>

          </Container>
        </div>
      </div>
    </>
  );
}

export default App;
