import React, { Component } from 'react'
import firebase from '../../Firebase'
import './Generacionm.css'

export default class Generacionm extends Component {
  constructor () {
    super()
    this.ref = firebase.firestore().collection('messages')
    this.state = {
      asunto: '',
      descripcion: '',
      imgp: 0,
      estatus: 'Activo'
    }
  }

  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value
    this.setState(state)
  }

  handleImage (event) {
    const file = event.target.files[0]
    const storageRef = firebase.storage().ref(`imgs/${file.name}`)
    const task = storageRef.put(file)
    task.on('state_changed', (snapshot) => {
      const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      this.setState({
        imgp: percentage
      })
    }, error => {
      console.error(error.message)
    }, () => storageRef.getDownloadURL().then(url => {
      const record = url
      this.setState({
        imagen: record
      })
    }))
  }

  onSubmit = (e) => {
    e.preventDefault()
    const { asunto, descripcion, imagen, estatus } = this.state
    this.ref.add({
      asunto,
      descripcion,
      imagen,
      estatus
    }).then((docRef) => {
      this.setState({
        asunto: '',
        descripcion: '',
        imagen: '',
        estatus: ''
      })
      this.props.history.push('/')
    })
    .catch((error) => {
      console.error('Error al crear: ', error)
    })
  }

  render() {
    const { asunto, descripcion, estatus } = this.state
    return (
      <div style={{ margin: '80px' }}>
        <div>
          <div>
            <h1>
              Generacion de Boletin
            </h1>
          </div>
          <div>
            <form className='form-container-g' onSubmit={this.onSubmit}>

              <div className='form-content'>
                <label for='asunto' className='text-g'>Asunto:</label>
                <input className='input-g' name='asunto' value={asunto} onChange={this.onChange} placeholder='Asunto' />
              </div>
              <div className='form-content'>
                <label for='descripcion' className='text-g'>Descripcion:</label>
                <textArea className='input-g' name='descripcion' onChange={this.onChange} placeholder='Mensaje' cols='80' rows='3'>{descripcion}</textArea>
              </div>
              <div className='form-content'>
                <label for='img' className='text-g'>Imagen:</label>
                <input className='input-g' type='file' onChange={this.handleImage.bind(this)} />
                <progress value={this.state.imgp}/>
              </div>
              <button type='submit'>Enviar</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}
