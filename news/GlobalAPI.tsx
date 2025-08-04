import { create } from "apisauce";

const api = create({
    baseURL: 'https://newsapi.org/v2',
  })

const apiKey='?country=us&apiKey=c05fc8517c5140a0aaa86806a85f6886'

const getTopHeadline=api.get('/top-headlines'+ apiKey)

export default{
    getTopHeadline
}