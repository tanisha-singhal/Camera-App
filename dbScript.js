// Database create/open=>camera
//database objectStore=>gallery
//photo capture/video blob store=>gallery
//format
// data{
//mId:64566467436654,
//type:img/video,
//media: content,
//}
let dbAccess;
let container = document.querySelector(".container");
let request = indexedDB.open("Camera", 1);
// success event is called when you create or open a database
request.addEventListener("success", function () {
  dbAccess = request.result; //gives access to the database
});
//upgradeneeded event is called when you create or change the version of a database.
request.addEventListener("upgradeneeded", function () {
  let db = request.result;
  db.createObjectStore("gallery", { keyPath: "mId" }); //to create a object store in a database
});
request.addEventListener("error", function () {
  alert("An error occured");
});
function addMedia(type, media) {
  //assumption - we have dbAccess
  let tx = dbAccess.transaction("gallery", "readwrite"); //transaction is a process which give access to read/write or upgrade the database.
  let galleryObjectStore = tx.objectStore("gallery"); //select object store from the transaction
  let data = {
    mId: Date.now(), // to uniquely identify an object.
    type,
    media,
  };
  galleryObjectStore.add(data);
}
function viewMedia() {
  //assumption - we have dbAccess
  let tx = dbAccess.transaction("gallery", "readonly");
  let galleryObjectStore = tx.objectStore("gallery");
  let req = galleryObjectStore.openCursor();
  req.addEventListener("success", function () {
    let cursor = req.result;
    if (cursor) {
      let div = document.createElement("div");
      div.classList.add("media-card");
      div.innerHTML = ` <div class="media-container">
            </div>
            <div class="action-container">
                <button class="download" data-id="${cursor.value.mId}">Download</button>
                <button class="delete" data-id="${cursor.value.mId}">Delete</button>
            </div>`;

      let downloadBtn = div.querySelector(".download");
      let deleteBtn=div.querySelector(".delete");
      deleteBtn.addEventListener("click",function(e){
        let mId=e.currentTarget.getAttribute("data-id");

        e.currentTarget.parentElement.parentElement.remove();
        deleteFromDB(mId);
      })

      if (cursor.value.type == "img") {
        let img = document.createElement("img");
        img.classList.add("media-gallery");
        img.src = cursor.value.media;
        let mediaContainer = div.querySelector(".media-container");
        mediaContainer.appendChild(img);

        downloadBtn.addEventListener("click", function (e) {
          let a = document.createElement("a");
          a.download = "image.png";
          a.href =e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src ;
          a.click();
          a.remove();
        });
      } else {
        let video = document.createElement("video");
        video.classList.add("media-gallery");
        video.src = window.URL.createObjectURL(cursor.value.media);
        video.addEventListener("mouseenter", function () {
          video.currentTime = 0;
          video.play();
        });
        video.addEventListener("mouseleave", function () {
          video.pause();
        });

        video.controls = true;
        video.loop = true;
        let mediaContainer = div.querySelector(".media-container");
        mediaContainer.appendChild(video);

        downloadBtn.addEventListener("click", function (e) {
          let a = document.createElement("a");
          a.download = "video.mp4";
          a.href =e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src ;
          a.click();
          a.remove();
        });
      }
      container.appendChild(div);
      cursor.continue();
    }
  });
}

function deleteFromDB(mId){
  let tx=dbAccess.transaction("gallery","readwrite");
  let galleryObjectStore=tx.objectStore("gallery");
  galleryObjectStore.delete(Number(mId));
}
