import axios from 'axios';
import config from '../config/config';
import { getCookie } from '../pages/utils/cookieManager';

const API_URL = config.API_URL;

export interface Subscription {
  subscription_id: string;
  user_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  plan_amount_cop: number;
  current_period_start: string;
  current_period_end: string;
}

export const getSubscriptionStatus = async (): Promise<Subscription> => {
  const token = getCookie(document.cookie, 'token');
  const response = await axios.get<Subscription>(`${API_URL}/subscriptions/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const activateSubscription = async (): Promise<Subscription> => {
  const token = getCookie(document.cookie, 'token');
  const response = await axios.post<Subscription>(`${API_URL}/subscriptions/activate`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

