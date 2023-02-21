import axios from 'axios';


const headers = {
  'Content-Type': 'application/json',
  // 'Authorization': 'Bearer <token>',
};

export const getToken = (username) =>
  axios.get(`http://localhost:3001/token/${username}`).then((twilioUser) => twilioUser.data.jwt);


export const createUser_API = async (username) => {
  var body = {
    "username": username
  }
  axios.post('http://localhost:3001/createUser', body, { headers })
    .then(res => {
      console.log(res)
      return res;
    })
    .catch(error => {
      console.log(error)
      return error;
    });

  // const res = await axios.post(`http://localhost:3001/createUser`, body);
  // return res;
};