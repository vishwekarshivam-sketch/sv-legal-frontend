const API_URL = "https://sv-legal-backend-production.up.railway.app";

function enterWebsite(){
    document.getElementById("disclaimerBox").style.display="none";
    document.getElementById("mainContent").style.display="block";
}

document.getElementById("legalForm").addEventListener("submit", async (e)=>{
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("mobile", document.getElementById("mobile").value);
    formData.append("formType", document.getElementById("formType").value);
    formData.append("description", document.getElementById("description").value);

    let file = document.getElementById("documentFile").files[0];
    if(file) formData.append("document", file);

    const res = await fetch(`${API_URL}/formSubmit`,{
        method:"POST",
        body:formData
    });

    document.getElementById("statusMsg").innerText =
        res.status===200 ? "Request Submitted ✔" : "Error — Try Again";
});
