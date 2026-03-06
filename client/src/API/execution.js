import axios from 'axios'

const JUDGE0_API = 'https://ce.judge0.com'

export const executeCode = async (languageId, code, codeInput) => {
    const response = await axios.post(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        {
            source_code: code,
            language_id: languageId,
            stdin: codeInput || '',
        }
    )

    return response.data
}