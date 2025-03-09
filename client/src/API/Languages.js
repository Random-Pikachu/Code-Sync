import axios from "axios";

const API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})

export const getLanguages = async () => {
    try {
        const response = await API.get('/runtimes');
        return response.data;
    }

    catch (error) {
        console.log(error)
        return []
    }
}