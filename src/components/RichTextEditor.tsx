import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function RichTextEditor({ value, onChange, placeholder, height = '120px' }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block', 'link'
  ];

  return (
    <div className="rich-text-editor mb-4">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight: height }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: calc(${height} - 42px);
          font-family: inherit;
          padding: 12px 15px;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 0.5rem 0.5rem 0 0;
          padding: 8px;
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 0 0 0.5rem 0.5rem;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        .rich-text-editor .ql-toolbar button {
          padding: 4px;
          margin: 1px;
        }
        @media (max-width: 640px) {
          .rich-text-editor .ql-toolbar {
            padding: 6px;
          }
          .rich-text-editor .ql-toolbar .ql-formats {
            margin-right: 4px;
          }
          .rich-text-editor .ql-toolbar button {
            padding: 3px;
            margin: 0.5px;
          }
          .rich-text-editor .ql-editor {
            padding: 10px 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}