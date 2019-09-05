import axios from '@/libs/api.request'

export const userList = () => {
  return axios.request({
    url: 'api/user/findList',
    method: 'get'
  })
}

export const save = (data) => {
  return axios.request({ url: '/api/user/create', data, method: 'post' })
}

export const login = ({ userName, password }) => {
  const data = {
    email: userName,
    password
  }
  console.log(5555555555555)
  return axios.request({
    url: 'api/user/login',
    data,
    method: 'post'
  })
  // return axios.request({
  //   url: 'api/user/login',
  //   data: 'email=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '',
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'X-Requested-With': 'XMLHttpRequest'
  //   }
  // })
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'api/user/auth',
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}

export const getUnreadCount = () => {
  return axios.request({
    url: 'message/count',
    method: 'get'
  })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export default {
  userList,
  save,
  login
}
