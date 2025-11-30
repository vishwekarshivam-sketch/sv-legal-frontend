const API = "https://sv-legal-backend-production.up.railway.app/submit";

document.getElementById("requestForm").addEventListener("submit", async (e)=>{
    e.preventDefault();

    const file = document.getElementById("document").files[0];
    const formData = new FormData();
    
    formData.append("name", document.getElementById("name").value);
    formData.append("formType", document.getElementById("formType").value);
    formData.append("mobile", document.getElementById("mobile").value);
    formData.append("document", file);

    const res = await fetch(API, { method: "POST", body: formData });
    document.getElementById("status").innerText = 
        res.ok ? "Request submitted successfully." : "Submission failed!";
});
