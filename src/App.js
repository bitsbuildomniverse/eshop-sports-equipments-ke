import React from 'react';
import './App.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import { auth, createUserProfileDocument } from './firebase/firebase.utils';
import { connect } from 'react-redux';
import { setCurrentUser } from './redux/User/user-actions';
import { selectCurrentUser } from './redux/User/user-selector';
import { createStructuredSelector } from 'reselect';

import HomePage from './Components/HomePage/HomePage';
import ShopPage from './Components/Shop/Shop';
import Header from './Components/Header/Header';
import SignInAndSignUp from './Components/Sign_In_Up/SignInAndSignUp';
import Checkout from './Components/Checkout/Checkout';


class App extends React.Component {

  unsubscribeFromAuth = null;

  componentDidMount() {
    const {setCurrentUser} = this.props;
    //Establish session between app and Google.
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async userAuth => {
      if(userAuth) {
        const userRef = await createUserProfileDocument(userAuth);
        userRef.onSnapshot(snapShot => {
          setCurrentUser({
            currentUser: { id: snapShot.id, ...snapShot.data() }
          })
        });
      } else {
        setCurrentUser(userAuth);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth(); //closing session.
  }

  render() {
    return (
      <div>
        <Header />
        <Switch>
          <Route exact path="/" component={HomePage}/>
          <Route path="/shop" component={ShopPage}/>
          <Route exact path="/checkout" component={Checkout}/>
          <Route exact path="/signin" render={() => this.props.currentUser? (
              <Redirect to="/" />
            ) : (
              <SignInAndSignUp />
            )
          }/>
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
    currentUser: selectCurrentUser
})

const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);