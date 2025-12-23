import { apiClient } from "../apiClient";

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const contactService = {
  sendContactForm: async (data: ContactFormData): Promise<void> => {
    const response = await apiClient.post("/contact/send", data);
    return response.data;
  },
};
