import React, { useEffect, useState } from 'react';

import MainGrid from "../src/components/MainGrid";
import Box from "../src/components/Box";
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from "../src/lib/AlurakutCommons";
import { ProfileRelationsBoxWrapper } from "../src/components/ProfileRelations";

import jwt from 'jsonwebtoken';
import nookies from 'nookies';

const { READ_ONLY_TOKEN } = process.env;

function ProfileSidebar(propriedades) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }} />
      <hr />
      <p>
        <a className="boxLink" href={`https://github.com/${propriedades.githubUser}`}>
          @{propriedades.githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}
function ProfileRelationsBox(propriedades) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {propriedades.title} ({propriedades.item.length})
      </h2>
      <ul>
        {propriedades.item.filter((item, idx) => idx < 6).map((itemAtual) => {
          return (
            <li key={itemAtual.id || itemAtual}>
              <a href={`/users/${itemAtual.title || itemAtual.login}`}>
                <img src={itemAtual.imageUrl || itemAtual.avatar_url} />
                <span>{itemAtual.title || itemAtual.login}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const usuario = props.githubUser;
  const [comunidades, setComunidades] = useState([]);

  const [userProps, setUserProps] = useState([])
  const [seguidores, setSeguidores] = useState([]);
  const [seguindo, setSeguindo] = useState([]);
  const [primeiroNome, setPrimeiroNome] = useState('');

  useEffect(function () {
    fetch(`https://api.github.com/users/${usuario}/followers`)
      .then(function (respostaServidor) {
        return respostaServidor.json();
      })
      .then(function (respostaCompleta) {
        setSeguidores(respostaCompleta);
      })
    fetch(`https://api.github.com/users/${usuario}/following`)
      .then(function (respostaServidor) {
        return respostaServidor.json();
      })
      .then(function (respostaCompleta) {
        setSeguindo(respostaCompleta);
      })
    fetch(`https://api.github.com/users/${usuario}`)
      .then(function (respostaServidor) {
        return respostaServidor.json();
      })
      .then(function (respostaCompleta) {
        setUserProps(respostaCompleta);
        const nome = respostaCompleta.name;
        setPrimeiroNome(nome.split(' ')[0]);
      })

    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': READ_ONLY_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "query": `query{
        allCommunities {
          title
          id
          imageUrl
          creatorSlug
        }
      }`})
    })
      .then((response) => response.json())
      .then((respostaCompleta) => {
        setComunidades(respostaCompleta.data.allCommunities);
      })
  }, [])
  return (
    <>
      <AlurakutMenu githubUser={usuario} />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar githubUser={usuario} />
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">
              Bem vindo, {primeiroNome}
            </h1>
            <p>
              {userProps.bio}
            </p>
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2 className="subTitle">O que voc?? deseja fazer?</h2>
            <form onSubmit={function handleCreateCommunity(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);
              const comunidade = {
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
                creatorSlug: usuario,
              }
              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              }).then(async (response) => {
                const dados = await response.json();
                setComunidades([...comunidades, comunidade]);
              })
            }}>
              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>
              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa"
                  name="image"
                  aria-label="Coloque uma URL para usarmos de capa"
                />
              </div>
              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          <ProfileRelationsBox
            title={'Seguidores'}
            item={seguidores}
          />
          <ProfileRelationsBox
            title={'Comunidades'}
            item={comunidades}
          />
          <ProfileRelationsBox
            title={'Seguindo'}
            item={seguindo}
          />
        </div>
      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const token = nookies.get(context).USER_TOKEN;

  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
    .then((resposta) => resposta.json());
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }
  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    },
  }
}