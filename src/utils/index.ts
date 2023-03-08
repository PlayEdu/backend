import { assert } from "console";
import moment from "moment";
import { VideoParseInfo } from "../types";

export function getToken(): string {
  return window.localStorage.getItem("playedu-backend-token") || "";
}

export function setToken(token: string) {
  window.localStorage.setItem("playedu-backend-token", token);
}

export function clearToken() {
  window.localStorage.removeItem("playedu-backend-token");
}

export function dateFormat(dateStr: string) {
  return moment(dateStr).format("YYYY-MM-DD HH:mm");
}

export function generateUUID(): string {
  let guid = "";
  for (let i = 1; i <= 32; i++) {
    let n = Math.floor(Math.random() * 16.0).toString(16);
    guid += n;
    if (i === 8 || i === 12 || i === 16 || i === 20) guid += "-";
  }
  return guid;
}

export function transformBase64ToBlob(
  base64: string,
  mime: string,
  filename: string
): File {
  const arr = base64.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function parseVideo(file: File): Promise<VideoParseInfo> {
  return new Promise((resolve, reject) => {
    let video = document.createElement("video");
    video.muted = true;
    video.setAttribute("src", URL.createObjectURL(file));
    video.setAttribute("autoplay", "autoplay");
    video.setAttribute("crossOrigin", "anonymous"); //设置跨域 否则toDataURL导出图片失败
    video.setAttribute("width", "400"); //设置大小，如果不设置，下面的canvas就要按需设置
    video.setAttribute("height", "300");
    video.currentTime = 7; //视频时长，一定要设置，不然大概率白屏
    video.addEventListener("loadeddata", function () {
      let canvas = document.createElement("canvas"),
        width = video.width, //canvas的尺寸和图片一样
        height = video.height;
      canvas.width = width; //画布大小，默认为视频宽高
      canvas.height = height;
      let ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject("无法捕获视频帧");
      }
      ctx.drawImage(video, 0, 0, width, height); //绘制canvas
      let dataURL = canvas.toDataURL("image/png"); //转换为base64
      const imageFile = transformBase64ToBlob(
        dataURL,
        "image/png",
        file.name + ".png"
      );
      video.remove();
      let info: VideoParseInfo = {
        poster: imageFile,
        duration: parseInt(video.duration + ""),
      };
      return resolve(info);
    });
  });
}

export function getHost() {
  return window.location.protocol + "//" + window.location.host+"/";
}
