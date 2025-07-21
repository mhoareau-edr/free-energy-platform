import { useState } from "react";

export default function UploaderPhotosPose({ onFilesReady }) {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    onFilesReady(selected);
  };

  return (
    <div className="p-4 bg-gray-50 border rounded mb-4 dark:bg-[#1d2125] dark:border-0">
      <label className="block font-medium mb-2 text-sm">Ajouter des photos de la pose :</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="form-input text-sm dark:border-gray-800"
      />
      {files.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">{files.length} photo(s) sélectionnée(s)</p>
      )}
    </div>
  );
}
