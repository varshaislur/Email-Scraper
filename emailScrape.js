let EmailScrapeButton=document.getElementById("EmailScrapeButton")
let emailList=document.getElementById("email-list")
let CopyEmailsButton = document.getElementById("CopyEmailsButton");
let emails = [];
//recieve emails from content script

chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
     emails= request.emails
    if(emails){
        alert("emails have been scraped")
        emails.map((email)=>{
            let li =document.createElement("li")
            li.innerText=email
            emailList.appendChild(li)

        })
    }else{
        let li=document.createElement("li")
        li.innerText="No Emails found"
        emailList.appendChild(li)
    }
})
CopyEmailsButton.addEventListener("click", () => {
    if (emails && emails.length > 0) {
        const emailText = emails.join('\n');
        navigator.clipboard.writeText(emailText).then(() => {
            alert('Emails copied to clipboard');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    } else {
        alert('No emails to copy');
    }
});

EmailScrapeButton.addEventListener("click",async()=>{
    //get current active tab

    let [tab] = await chrome.tabs.query({active:true, currentWindow: true});
   
    //works for this too
    //tabs= await ...
    //alert(tabs[0].id)

    chrome.scripting
    .executeScript({
      target : {tabId : tab.id},
      func: scrapeEmailFromPage,
    })
})

function scrapeEmailFromPage() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const pageText = document.body.textContent;
    const emails = pageText.match(emailRegex);

    if (emails) {
       
        //send emails to popup
        chrome.runtime.sendMessage({emails})

    } else {
        alert('No email addresses found.');
    }
}
