/* eslint-disable no-throw-literal */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';

import { Form, SubmitButton, List, Input, Error } from './styles';

export default class Main extends Component {
  state = {
    newRepository: '',
    repositories: [],
    loading: false,
    valid: true,
    errorMessage: '',
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = event => {
    this.setState({ newRepository: event.target.value });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepository, repositories } = this.state;

      const repositoryExists = repositories.find(
        repository => repository.name === newRepository
      );

      if (repositoryExists) {
        throw 'Repositório duplicado!';
      }

      const response = await api.get(`/repos/${newRepository}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepository: '',
        valid: true,
        loading: false,
        errorMessage: '',
      });
    } catch (error) {
      let message = '';

      if (error !== 'Repositório duplicado!') {
        message = 'Repositório inexistente!';
      } else {
        message = error;
      }

      this.setState({ valid: false, newRepository: '', errorMessage: message });
    }

    this.setState({ loading: false });
  };

  render() {
    const {
      newRepository,
      loading,
      repositories,
      valid,
      errorMessage,
    } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <Input
            type="text"
            placeholder="Adicionar repositório"
            valid={!!valid}
            value={newRepository}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        {valid ? <></> : <Error>{errorMessage}</Error>}

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
