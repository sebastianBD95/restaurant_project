import axios from 'axios';
import config from '../config/config';
import { getCookie } from '../pages/utils/cookieManager';

const API_URL = config.API_URL;

export interface Subscription {
  subscription_id: string;
  restaurant_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  plan_amount_cop: number;
  current_period_start: string;
  current_period_end: string;
}

export const getSubscriptionStatus = async (restaurantId: string): Promise<Subscription> => {
  const token = getCookie(document.cookie, 'token');
  const response = await axios.get<Subscription>(`${API_URL}/subscriptions/status?restaurant_id=${restaurantId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const activateSubscription = async (restaurantId: string): Promise<Subscription> => {
  const token = getCookie(document.cookie, 'token');
  const response = await axios.post<Subscription>(`${API_URL}/subscriptions/activate?restaurant_id=${restaurantId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

