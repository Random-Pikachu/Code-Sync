import axios from 'axios'

const API  = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})

export const executeCode = async (language, ver, code, codeInput) => {
    const response = await API.post('/execute', {
        language : language,
        version: ver,
        files : [
            {
                content : code,
            }
        ],
        stdin: codeInput,
    })

    return response.data
}