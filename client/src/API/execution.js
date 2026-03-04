import axios from 'axios'

const SERVER_URL = 'https://code-sync-rlsh.onrender.com'

export const executeCode = async (language, version, code, codeInput) => {
    const response = await axios.post(`${SERVER_URL}/api/execute`, {
        language: language,
        version: version,
        files: [
            {
                content: code,
            }
        ],
        stdin: codeInput,
    })

    return response.data
}