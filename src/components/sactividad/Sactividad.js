import React, { Component } from 'react'
import firebase from '../../Firebase'
import './Sactividad.css'
import TextField from '@material-ui/core/TextField'
import Fab from '@material-ui/core/Fab'
import DoneIcon from '@material-ui/icons/Done'
import CloseIcon from '@material-ui/icons/Close'
import Input from '@material-ui/core/Input'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { withStyles } from '@material-ui/core/styles';


export default class Sactividad extends Component {
  constructor (props) {
    super(props)
    this.ref = firebase.firestore().collection('actividades').doc(this.props.match.params.id).collection('evidencias')
    this.unsubscribe = null;
    this.state = {
      imgeevi: ' ',
      relevancia: '',
      resultado: '',
      evidencia: '',
      evidencias: [],
      imge: 0,
      checkedCancelada: false,
      checkedReprogramar: false,
      motivo_cancelado: '',
      fechai: '',
      horai: '',
      fechaf: '',
      horaf: '',
      estatus : ''
    }
    this.handleChangeCancel = this.handleChangeCancel.bind(this)
    this.handleChangeRe = this.handleChangeRe.bind(this)
  }

  onCollectionUpdate = (querySnapshot) => {
    const evidencias = [];
    querySnapshot.forEach((doc) => {
      const { seguimientos, seguimienton, evidencia, relevancia, motivo_cancelado, fechai, horai, fechaf, horaf, estatus } = doc.data();
      evidencias.push({
        key: doc.id,
        doc,
        seguimientos,
        seguimienton,
        evidencia,
        relevancia,
        motivo_cancelado,
        fechai,
        horai,
        fechaf,
        horaf,
        estatus
      });
    });
    this.setState({
      evidencias
   });
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value
    this.setState(state)
  }

  handleChangeCancel(checkedCancelada) {
    this.setState({
      checkedCancelada: !this.state.checkedCancelada,
    });
  }

  handleChangeRe(checkedReprogramar) {
    this.setState({
      checkedReprogramar: !this.state.checkedReprogramar,
    });
  }
  handleBack() {
      this.props.history.push('/ActividadesRegistradas');
    }

  handleImage (event) {
    const file = event.target.files[0]
    const storageRef = firebase.storage().ref(`evidencias/${file.name}`)
    const task = storageRef.put(file)
    task.on('state_changed', (snapshot) => {
      const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      this.setState({
        imge: percentage
      })
    }, error => {
      console.error(error.message)
    }, () => storageRef.getDownloadURL().then(url => {
      const record = url
      this.setState({
        imgeevi: record
      })
    }))
  }

  onSubmit = (e) => {
    e.preventDefault()
    const { resultado, relevancia, motivo_cancelado, checkedCancelada, checkedReprogramar, fechai, horai, fechaf, horaf, imgeevi, estatus } = this.state
    this.ref.add({
      resultado,
      relevancia,
      motivo_cancelado,
      checkedCancelada,
      checkedReprogramar,
      fechai,
      horai,
      fechaf,
      horaf,
      imgeevi,
      estatus
    }).then((docRef) => {
      this.setState({
        resultado: '',
        seguimienton: false,
        descripcion: '',
        motivo_cancelado: '',
        checkedCancelada: false,
        checkedReprogramar: false,
        fechai: '',
        horai: '',
        fechaf: '',
        horaf: '',
        imgeevi: '',
        estatus : ''
      })
      this.props.history.push('/ActividadesRegistradas')
        alert('Se Envio el formulario')
    })
    .catch((error) => {
      console.error('Error al crear: ', error)
    })
  }

  render () {
    const IOSSwitch = withStyles((theme) => ({
      root: {
        width: 42,
        height: 26,
        padding: 0,
        margin: theme.spacing(1),
      },
      switchBase: {
        padding: 1,
        '&$checked': {
          transform: 'translateX(16px)',
          color: theme.palette.common.white,
          '& + $track': {
            backgroundColor: '#52d869',
            opacity: 1,
            border: 'none',
          },
        },
        '&$focusVisible $thumb': {
          color: '#52d869',
          border: '6px solid #fff',
        },
      },
      thumb: {
        width: 24,
        height: 24,
      },
      track: {
        borderRadius: 26 / 2,
        border: `1px solid ${theme.palette.grey[400]}`,
        backgroundColor: theme.palette.grey[50],
        opacity: 1,
        transition: theme.transitions.create(['background-color', 'border']),
      },
      checked: {},
      focusVisible: {},
    }))(({ classes, ...props }) => {
      return (
        <Switch
          focusVisibleClassName={classes.focusVisible}
          disableRipple
          classes={{
            root: classes.root,
            switchBase: classes.switchBase,
            thumb: classes.thumb,
            track: classes.track,
            checked: classes.checked,
          }}
          {...props}

        />
      );
    });

    if (this.state.checkedCancelada){
      this.state.estatus = 'Cancelado'
    }
    if (!this.state.checkedCancelada){
      this.state.estatus = 'Realizado'
    }
    if (this.state.checkedCancelada && this.state.checkedReprogramar){
      this.state.estatus = 'Reprogramado'
    }
    console.log(this.state.estatus)

    return (
      <div className='mg-conta'>
        <div>
          <div className='divtop-mg' />
          <div className='form-content-gm'>
            <form noValidate autoComplete='off' className='mensajesg-container' onSubmit={this.onSubmit}>
              <h2>Seguimiento de Actividad</h2>


              <FormControlLabel
                control={
                  <IOSSwitch
                    name='checkedCancelada'
                    checked={this.state.checkedCancelada}
                    onChange={this.handleChangeCancel}
                  />
                }
                label='¿Cancelar Actividad?'
                style={{ marginTop: '20px' }}
              />
              {this.state.checkedCancelada === true &&
                <div className='div_cancel'>
                  <TextField
                    label='Motivo de cancelación'
                    style={{marginTop: '15px'}}
                    name='motivo_cancelado'
                    onChange={this.onChange}
                    inputProps={{
                      maxLength: 300,
                    }}
                    multiline
                    required
                  />
                  <FormControlLabel
                    control={
                      <IOSSwitch name='checkedReprogramar'
                        checked={this.state.checkedReprogramar}
                        onChange={this.handleChangeRe}
                      />
                    }
                    label='Re-programar'
                    style={{ marginTop: '20px' }}
                  />
                </div>
              }
              {this.state.checkedReprogramar === true &&
                <div>
                  <p className='martop-dt'>Fecha y hora de inicio *</p>
                  <div className='date-cont'>
                    <TextField
                      type='date'
                      style={{ width: '45%' }}
                      name='fechai'
                      onChange={this.onChange}
                      required
                    />
                    <TextField
                      type='time'
                      style={{ width: '45%' }}
                      name='horai'
                      onChange={this.onChange}
                      required
                    />
                  </div>

                  <div className='date-cont'>
                    <TextField
                      label='Duración'
                      style={{ marginTop: '15px', width: '45%' }}
                      name='duracion'
                      onChange={this.onChange}
                      required
                    />
                    <div className='hra-hras'>
                      <p>hr/hrs</p>
                    </div>
                  </div>

                </div>
              }

              <TextField
                label='Descripcion de Actividad'
                style={{ marginTop: '15px' }}
                name='resultado'
                onChange={this.onChange}
                inputProps={{
                  maxLength: 150
                }}
                multiline
                required
              />
              <TextField
                label='Relevancia'
                style={{ marginTop: '15px' }}
                name='relevancia'
                onChange={this.onChange}
                inputProps={{
                  maxLength: 300
                }}
                multiline
                required
              />

              {this.state.checkedCancelada === false &&
                <div>
                  <Input
                    type='file'
                    style={{marginTop: '30px'}}
                    onChange={this.handleImage.bind(this)}
                  />
                  <progress className='progress2' value={this.state.imge} />
                </div>
              }
              <div className='add-gb'>
                <Fab color='primary' aria-label='add' style={{ background: 'green' }} type='submit'>
                  <DoneIcon />
                </Fab>
              </div>
              <div className='save-btr'>
                <Fab color='primary' aria-label='add' style={{ background: 'red' }} onClick={this.handleBack.bind(this)}>
                  <CloseIcon />
                </Fab>
              </div>
            </form>
          </div>
        </div>
      </div>

    )
  }
}
