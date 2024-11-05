export interface Uploads {
    userId: string;
    data: FileUploads[];
  }
  export interface Thumbnail {
    thumbnail?: string;
    standardThumbnail?: string;
    mediumThumbnail?: string;
    maxresThumbnail?: string;
    hightThumbnail?: string;
  }
  export interface FileUploads extends Thumbnail{
    source?: string;
    type: string;
    url: string;
  }
  
  
  