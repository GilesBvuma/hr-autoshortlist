// PATH: src/Components/ApplyJob.jsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axiosCandidate";

function ApplyJob() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    skills: "",
  });

  const [cv, setCv] = useState(null);
  const [letter, setLetter] = useState(null);

  const changeHandler = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("jobId", id);
    data.append("fullname", formData.fullname);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("skills", formData.skills);
    data.append("cv", cv);
    data.append("letter", letter);

    try {
      await axios.post("/applications", data);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Error submitting application", err);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Apply for this Position</h2>

      <form onSubmit={submitHandler} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          name="fullname"
          onChange={changeHandler}
          className="border p-2 w-full"
        />

        <input
          type="email"
          placeholder="Email"
          name="email"
          onChange={changeHandler}
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Phone"
          name="phone"
          onChange={changeHandler}
          className="border p-2 w-full"
        />

        <textarea
          placeholder="Skills Summary"
          name="skills"
          onChange={changeHandler}
          className="border p-2 w-full h-32"
        />

        <label>Upload CV (PDF):</label>
        <input type="file" onChange={(e) => setCv(e.target.files[0])} />

        <label>Upload Application Letter:</label>
        <input type="file" onChange={(e) => setLetter(e.target.files[0])} />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}

export default ApplyJob;
