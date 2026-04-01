import apiClient from './apiClient';

export const videoService = {
  uploadVideo: async (formData, onUploadProgress) => {
    const response = await apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },
  getMyUploads: async () => {
    const response = await apiClient.get('/videos/my-uploads');
    return response.data;
  },
  getOrgVideos: async () => {
    const response = await apiClient.get('/videos/organization');
    return response.data;
  },
  getPlayUrl: async (id) => {
    const response = await apiClient.get(`/videos/play/${id}`);
    return response.data;
  }
};