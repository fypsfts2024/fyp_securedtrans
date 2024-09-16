"use client";
import React, { useState, useRef } from 'react';

type AvatarUpdateProps = {
    avatarUrl: string;
};

export function AvatarUpdate({ avatarUrl }: AvatarUpdateProps) {
    const [avatar, setAvatar] = useState<string>(avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newFile = e.target.files[0];
            setAvatar(URL.createObjectURL(newFile));
        }
    };

    const handleCancel = () => {
        setAvatar(avatarUrl);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="text-center w-full">
                <label className="label">
                    <input
                        ref={fileInputRef}
                        id="avatar"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        name="avatar"
                        onChange={handleFileChange}
                    />
                    <figure className="relative w-full aspect-square">
                        <img
                            src={avatar}
                            className="cursor-pointer object-cover w-full h-full box-border border-2 border-transparent shadow-md transition-all duration-300 ease-in-out"
                            alt="Avatar"
                        />
                        <figcaption className="cursor-pointer absolute top-0 opacity-0 bg-transparent ease-in-out h-full w-full hover:bg-black hover:bg-opacity-50 hover:opacity-100 flex items-center justify-center">
                            <img
                                src="https://raw.githubusercontent.com/ThiagoLuizNunes/angular-boilerplate/master/src/assets/imgs/camera-white.png"
                                className="size-[80px]"
                                alt="Camera Icon"
                            />
                        </figcaption>
                    </figure>
                </label>
            </div>

            {avatar !== avatarUrl && (
                <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-4 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition"
                >
                    Cancel
                </button>
            )}
        </div>
    );
}
// import React, { useState, useRef } from "react";

// type AvatarUpdateProps = {
//     avatarUrl: string;
// };

// export function AvatarUpdate({ avatarUrl }: AvatarUpdateProps) {
//     const [avatar, setAvatar] = useState<string>(avatarUrl);
//     const [file, setFile] = useState<File | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             const newFile = e.target.files[0];
//             setAvatar(URL.createObjectURL(newFile));
//             setFile(newFile);
//         }
//     };

//     const handleCancel = () => {
//         setAvatar(avatarUrl);
//         setFile(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = "";
//         }
//     };

//     // const handleCancel = () => {
//     //     // Reset the avatar back to the original URL and clear the selected file
//     //     setAvatar(avatarUrl);
//     //     setFile(null);
//     // };

//     return (
//         <div className="flex flex-col justify-center items-center w-full">
//             <div className="text-center w-full">
//                 <label className="label">
//                     <input
//                         ref={fileInputRef}
//                         id="avatar"
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         name="avatar"
//                         onChange={handleFileChange}
//                     />
//                     {/* <input
//                         id="avatar"
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         name="avatar"
//                         onChange={(e) => {
//                             if (e.target.files && e.target.files[0]) {
//                                 setAvatar(
//                                     URL.createObjectURL(e.target.files[0])
//                                 );
//                                 setFile(e.target.files[0]);
//                             }
//                         }}
//                     /> */}
//                     <figure className="relative w-full aspect-square">
//                         <img
//                             src={avatar}
//                             className="cursor-pointer object-cover w-full h-full box-border border-2 border-transparent shadow-md transition-all duration-300 ease-in-out"
//                             alt="Avatar"
//                         />
//                         <figcaption className="cursor-pointer absolute top-0 opacity-0 bg-transparent ease-in-out h-full w-full hover:bg-black hover:bg-opacity-50 hover:opacity-100 flex items-center justify-center">
//                             <img
//                                 src="https://raw.githubusercontent.com/ThiagoLuizNunes/angular-boilerplate/master/src/assets/imgs/camera-white.png"
//                                 className="size-[80px]"
//                                 alt="Camera Icon"
//                             />
//                         </figcaption>
//                     </figure>
//                 </label>
//             </div>

//             {/* Conditionally render the Cancel button if the user selects a new file */}
//             {file && (
//                 <button
//                     onClick={handleCancel}
//                     className="mt-4 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition"
//                 >
//                     Cancel
//                 </button>
//             )}

//             <input
//                 type="hidden"
//                 name="avatar-filename"
//                 value={file ? file.name : ""}
//             />
//         </div>
//     );
// }
