import client from "@/client/client";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";


export default function usePhoto() {
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const fetchPhotos = async () => {
            setLoading(true);
            try {
                const response = await client.get("api/photos/");
                setPhotos(response.data);
            } catch(e) {
                console.log("fetch photos error:", e);
            } finally {
                setLoading(false);
            }
        }

        if (isMounted) {
            fetchPhotos();
        }

        return () => {
            isMounted = false;
        }
    });

    const uploadPhoto = async(formData: FormData) => {
        try {
            const response = await client.post("api/photos/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            router.replace("/gallery");
            return response.data;
        } catch (error) {
            console.error("Error uploading photo:", error);
            throw error;
        }
    }

    return {loading, photos, uploadPhoto};

}