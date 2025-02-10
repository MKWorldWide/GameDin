import { useState, useRef } from 'react';
import useStore from '../../store/useStore';

const CreatePost = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef();
  const user = useStore(state => state.user);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('content', content);
      if (media) {
        formData.append('media', media);
      }
      await onPost(formData);
      setContent('');
      setMedia(null);
      fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setMedia(file);
    } else {
      alert('Please upload an image or video file');
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-4">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img src={user.avatar} alt={user.username} />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="What's on your mind?"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows="3"
              />

              {media && (
                <div className="mt-2 relative">
                  {media.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(media)}
                      alt="Upload preview"
                      className="max-h-48 rounded-lg"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(media)}
                      className="max-h-48 rounded-lg"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    className="btn btn-circle btn-sm absolute top-2 right-2"
                    onClick={() => {
                      setMedia(null);
                      fileInputRef.current.value = '';
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Add Media
                  </button>
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading || (!content.trim() && !media)}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
