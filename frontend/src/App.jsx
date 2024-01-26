import React from 'react'
import './App.css'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            todoList: [],
            activeItem: {
                id: null,
                title: '',
                completed: false
            },
            editing: false,
        }
        this.fetchTasks = this.fetchTasks.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getCookie = this.getCookie.bind(this)
        this.startEdit = this.startEdit.bind(this)
        this.deleteItem = this.deleteItem.bind(this)
        this.strikeUnstrike = this.strikeUnstrike.bind(this)
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    UNSAFE_componentWillMount() {
        this.fetchTasks()
    }

    fetchTasks() {
        fetch('http://127.0.0.1:8000/api/task-list/')
            .then(response => response.json()).then(data => this.setState({todoList: data}))
    }

    handleChange(e) {
        // let name = e.target.name
        let value = e.target.value
        this.setState({
            activeItem: {
                ...this.state.activeItem,
                title: value
            }
        })
    }

    handleSubmit(e) {
        e.preventDefault()
        console.log('ITEM:', this.state.activeItem)

        let csrfToken = this.getCookie('csrftoken')

        let url = 'http://127.0.0.1:8000/api/task-create/'

        if (this.state.editing === true) {
            url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
            this.setState({
                editing: false
            })
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(this.state.activeItem)
        }).then(() => {
            this.fetchTasks()
            this.setState({
                activeItem: {
                    id: null,
                    title: '',
                    completed: false
                }
            })
        }).catch(function (error) {
                console.log('ERROR:', error)
            }
        )
    }

    startEdit(task) {
        this.setState({activeItem: task, editing: true})
    }

    deleteItem(task) {
        let csrfToken = this.getCookie('csrftoken')
        fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        }).then((response) => {
            this.fetchTasks()
        })
    }

    strikeUnstrike(task) {
        task.completed = !task.completed
        let csrfToken = this.getCookie('csrftoken')
        let url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({'completed': task.completed, 'title': task.title})
        }).then(() => {
            this.fetchTasks()
        })
    }

    render() {
        let tasks = this.state.todoList
        let self = this
        return (
            <div className="container">
                <div id="task-container">
                    <div id="form-wrapper">
                        <form id="form" onSubmit={this.handleSubmit}>
                            <div className="flex-wrapper">
                                <div style={{flex: 6}}>
                                    <input onChange={this.handleChange} value={this.state.activeItem.title}
                                           className="form-control" id="title" type="text"
                                           name="title"
                                           placeholder="Add task"/>
                                </div>
                                <div style={{flex: 1}}>
                                    <input className="btn btn-warning" id="submit" type="submit" name="Add"/>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div id="list-wrapper">
                        {tasks.map(function (task, index) {
                            return (
                                <div key={index} className="task-wrapper flex-wrapper">
                                    <div onClick={() => self.strikeUnstrike(task)} style={{flex: 7}}>
                                        {task.completed === false ? (
                                            <span>{task.title}</span>
                                        ) : (
                                            <strike>{task.title}</strike>
                                        )}
                                    </div>
                                    <div style={{flex: 1}}>
                                        <button onClick={() => self.startEdit(task)}
                                                className="btn btn-sm btn-outline-info">Edit
                                        </button>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <button onClick={() => self.deleteItem(task)}
                                                className="btn btn-sm btn-outline-dark delete">-
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default App
