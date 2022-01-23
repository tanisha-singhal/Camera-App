let video=document.querySelector("video");
let body=document.querySelector("body");
let vdoBtn=document.querySelector("#record");
let capBtn=document.querySelector("#capture");
let galleryBtn=document.querySelector("#gallery");
let zoomIn=document.querySelector(".in");
let zoomOut=document.querySelector(".out");
//In contraints we will take those values whose inputs  we want to access from the Browser.
//In this case we want video input.
let constraints={video:true,audio:true};
let isRecording=false;
let mediaRecorder;
let chunks=[];
let filter="";
let minZoom=1;
let maxZoom=3;
let curZoom=1;
let filters=document.querySelectorAll(".filter");
for(let i=0;i<filters.length;i++){
    filters[i].addEventListener("click",function(e){
        console.log(1);
        filter=e.currentTarget.style.backgroundColor;
        //remove filter if exist
        //apply the new filter using the above value
        removeFilter();
        applyFilter(filter);
    })
}
galleryBtn.addEventListener("click",function(){
    location.assign("gallery.html");
})
vdoBtn.addEventListener("click",function(){
    let innerDiv=vdoBtn.querySelector("div");
   
    if(isRecording){
        mediaRecorder.stop();
        isRecording=false;
        innerDiv.classList.remove("record-animation");
    }else{
        mediaRecorder.start();
        filter="";
        removeFilter();
        video.style.transform="scale(1)";
        curZoom=1;
        isRecording=true;
        innerDiv.classList.add("record-animation");
    }

})

capBtn.addEventListener("click",function(){
    let innerDiv=capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function(){
        innerDiv.classList.remove("capture-animation");
    },500)
    capture();
})
zoomIn.addEventListener("click",function(){
    if(curZoom>maxZoom){
        return;
    }else{
        curZoom+=0.1;
        video.style.transform=`scale(${curZoom})`;
    }
})
zoomOut.addEventListener("click",function(){
    if(curZoom>minZoom){
        curZoom-=0.1;
        video.style.transform=`scale(${curZoom})`;
    }
})
//navigator is a object in browser and mediaDevices is a child object of navigator which contains a function which will give us an object containg video input after the promise is resolved.
//getUserMedia is a promise based function which take the contraints and gives a mediaStream object which contains the video  input after the promise is resolved.
navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream){
    // we set the srcObject of video tag to mediaStream .
    
    video.srcObject=mediaStream;
    mediaRecorder=new MediaRecorder(mediaStream);
    // media recorder provides functionality to easily record media.
    //dataavailable event is called when mediaRecorder cannot stroe more data.
    
    mediaRecorder.addEventListener("dataavailable",function(e){
        //in this function we push the data from the mediarecorder to chuks array.
        chunks.push(e.data);
    });
    // stop event ocurs when the mediaRecorder stops.
    mediaRecorder.addEventListener("stop",function(){
        //here we create a file/blob of type video/mp4 from chunks and after that make the chunks array empty.
        let blob=new Blob(chunks,{type:"video/mp4"});
        addMedia("video",blob);
        chunks=[];
        // we create a url for blob which is stored in browser.URL.createObjectURL method is provided by browser.
        // let url=URL.createObjectURL(blob);
        // let a=document.createElement("a");  //create an anchor tag
        // a.href=url;              
        // a.download="video/mp4";
        // a.click();    // download the file
        // a.remove();
    });
});

function capture(){
    let c=document.createElement("canvas");
    c.height=video.videoHeight;
    c.width=video.videoWidth;
    let ctx=c.getContext("2d");

    ctx.translate(c.width/2,c.height/2);
    ctx.scale(curZoom,curZoom);
    ctx.translate(-c.width/2,-c.height/2);
    ctx.drawImage(video,0,0);
    if(filter!=""){
        ctx.fillStyle=filter;
        ctx.fillRect(0,0,c.width,c.height);
    }
    // let a=document.createElement("a");
    // a.href=c.toDataURL();
    addMedia("img",c.toDataURL());
    // a.download="image.png"; 
    // a.click();
    // a.remove();
}

function applyFilter(filterColor){
let filterDiv=document.createElement("div");
filterDiv.classList.add("filter-div");
filterDiv.style.backgroundColor=filterColor;
body.appendChild(filterDiv);
}

function removeFilter(){
    let filterDiv=document.querySelector(".filter-div");
    if(filterDiv){
        filterDiv.remove();
    }
}