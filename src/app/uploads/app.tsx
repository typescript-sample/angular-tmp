// import * as React from "react";
// // import { async } from 'rxjs/internal/scheduler/async';
// import "./app.css";
// import DragDrop from "./components/DragDrop";
// import { FileUploads } from "./model";
// import {
//   deleteFile,
//   deleteFileYoutube,
//   fetchImageGalleryUploaded,
//   fetchImageUploaded,
//   getUser,
//   uploadVideoYoutube,
// } from "./service";
// import Axios from "axios";
// import { HttpRequest } from "axios-core";
// import { options } from "uione";
// import { typeFile } from "./components/UploadModal/UploadHook";
// import Uploads from "./components/UploadModal/UploadContainer";
// import { OnClick } from "react-hook-core";
// interface Props {
//   type?: typeFile;
//   post?: (
//     url: string,
//     obj: any,
//     options?:
//       | {
//           headers?: Headers | undefined;
//         }
//       | undefined
//   ) => Promise<any>;
//   url: string;
//   id: string;
// }

// const httpRequest = new HttpRequest(Axios, options);
// const httpPost = (
//   url: string,
//   obj: any,
//   options?: { headers?: Headers | undefined } | undefined
// ): Promise<any> => {
//   return httpRequest.post(url, obj, options);
// };
// const UploadFile = ({ type = "gallery", post = httpPost, url, id }: Props) => {
//   const [filesUploaded, setFilesUploaded] = React.useState<FileUploads[]>();
//   const [videoIdInput, setVideoIdInput] = React.useState<string>("");
//   React.useEffect(() => {
//     fecthGallery();
//   }, []);

//   const fecthGallery = async () => {
//     const rs = await fetchImageGalleryUploaded();
//     setFilesUploaded(rs);
//   };
//   const handleFetch = async (data: FileUploads[]) => {
//     setFilesUploaded(data);
//   };

//   const handleDeleteFile = async (url: string, type: string) => {
//     if (type === "youtube") {
//       await deleteFileYoutube(url);
//       setFilesUploaded(filesUploaded?.filter((file) => file.url !== url));
//     } else {
//       await deleteFile(url);
//       setFilesUploaded(filesUploaded?.filter((file) => file.url !== url));
//     }
//   };

//   const handleInput = (e: { target: { value: string } }) => {
//     setVideoIdInput(e.target.value);
//   };

//   const handleAddVideoYoutube = async (e:OnClick) => {
//     e.preventDefault()
//     if (videoIdInput !== "") {
//       const r = await uploadVideoYoutube(videoIdInput);
//       setVideoIdInput("");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="row">
//         <div className="col xl4 l5 m12 s12">
//           <div style={{ textAlign: "center" }}>
//             <Uploads
//               url={url}
//               id={id}
//               post={post}
//               setFileGallery={handleFetch}
//               type={type}
//             />
//             <div className="youtube-add">
//               <input
//                 onChange={handleInput}
//                 value={videoIdInput}
//                 className="input-video-id"
//                 type="type"
//                 placeholder="Input youtube video id"
//               />
//               <button
//                 className="btn-add-youtube"
//                 onClick={handleAddVideoYoutube}
//               >
//                 <i className="material-icons icon-delete">library_add</i>
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="col xl8 l7 m12 s12">
//           <div className="file-area">
//             <div className="label">
//               <i className="menu-type" />
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <i className="material-icons menu-type">description</i>
//                 <span className="menu-type">File</span>
//               </div>
//             </div>
//             {filesUploaded && filesUploaded.length > 0 && (
//               <DragDrop
//                 setList={setFilesUploaded}
//                 handleDeleteFile={handleDeleteFile}
//                 list={filesUploaded}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default UploadFile;
