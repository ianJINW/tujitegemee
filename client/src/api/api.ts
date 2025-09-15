import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./axios";

type MutationPayload = Record<string, unknown>;


const usePostInfo = (url:string) => {
  return useMutation({
    mutationFn: (data: MutationPayload) =>{return api.post(url, data)},
    onSuccess: (data) => {
      console.log("Info sent successfully:", data);
      alert("Info sent successfully");
    },
    onError: (error) => {
      console.error("Error sending info:", error);
    },
  })
}

const useGetInfo = (url: string) => {
  return useQuery({
    queryKey: [url], queryFn: async () => {
      const res = await api.get(url);
      return res.data;  
    }})
  }

export { usePostInfo , useGetInfo };