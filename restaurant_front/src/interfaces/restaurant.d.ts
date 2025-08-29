export interface ResturantDataRequest {
  name: string;
  description: string;
  image: File;
}

export interface ResturantDataResponse {
  restaurant_id: string;
  name: string;
  description: string;
  owner_id: string;
  image_url: string;
  created_at: string;
}
