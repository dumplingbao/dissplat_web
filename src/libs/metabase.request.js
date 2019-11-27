import HttpRequest from '@/libs/metabase.axios'
const baseUrl = 'http://localhost:3000/'

const axiosmetabase = new HttpRequest(baseUrl)
export default axiosmetabase
