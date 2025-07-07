fetch("/files").then(res=>res.json()).then(data=>{
    const tablebody=document.querySelector('#fileTable tbody');
   if(Array.isArray(data)){ data.forEach(item => {
        const row=document.createElement("tr")
       const sizeInKB = (item.size / 1024).toFixed(2) + " KB";//convert bytes into kilobytes,toFixed(2) rounds result upto 2 decimal places
      const uploaded = new Date(item.uploadedAt).toLocaleString();//converts a timestamp into a human-readable date and time string based on the user's local settings.
        row.innerHTML=`
        <td>${item.name}</td> 
        <td>${sizeInKB}</td>
        <td>${uploaded}</td>
       <td><form action="/download" method="get">
        <input type="hidden" name="filename" value="${item.name}">
        <button type="submit">Download</button>
        </form></td>`;
        tablebody.appendChild(row);
    });
    }
})