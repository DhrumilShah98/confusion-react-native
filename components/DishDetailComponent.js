import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, Button, Modal, StyleSheet, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
})

function RenderDish(props) {

    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200)
            return 'rtl';
        else if (dx > 200)
            return 'ltr'
        else
            return false;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            const drag = recognizeDrag(gestureState);
            if (drag == 'rtl') {
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add ' + dish.name + ' to your favorites?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel pressed'),
                            style: 'cancel'
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ? console.log('Already Favorite') : props.markFavorite(dish.dishId)
                        }
                    ],
                    { cancelable: false }
                );
            } else if (drag == 'ltr') {
                props.toggleModal();
            }
            return true;
        }
    });

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        }, {
                dialogTitle: 'Share ' + title
            });
    }
    if (dish != null) {
        return (
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={dish.name}
                    image={{ uri: baseUrl + dish.image }}>
                    <Text style={{ margin: 10 }}>
                        {dish.description}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already Favorite') : props.markFavorite(dish.dishId)}
                        />
                        <Icon
                            raised
                            reverse
                            name={'pencil'}
                            type='font-awesome'
                            color='#512DA8'
                            onPress={() => { props.toggleModal() }}
                        />
                        <Icon
                            raised
                            reverse
                            name={'share'}
                            type='font-awesome'
                            color='#51D2A8'
                            onPress={() => { shareDish(dish.name, dish.description, baseUrl + dish.image) }}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    else {
        return (<View></View>);
    }
}

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {
        return (
            <View key={index} style={{ margin: 15 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Rating
                    style={{ marginTop: 5, marginBottom: 5, alignItems: 'flex-start' }}
                    readonly={true}
                    fractions={0}
                    ratingCount={5}
                    startingValue={item.rating}
                    imageSize={10} />
                <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + new Date(item.date).toUTCString()}</Text>
            </View>
        );
    }

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title="Comments">
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()} />
            </Card>
        </Animatable.View>
    )
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rating: 5,
            author: '',
            comment: '',
            showModal: false
        }
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    addNewComment(dishId, rating, author, comment) {
        this.props.postComment(dishId, rating, author, comment);
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    resetForm() {
        this.setState({
            rating: 5,
            author: '',
            comment: '',
            showModal: false
        })
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        return (
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    markFavorite={() => this.markFavorite(dishId)}
                    toggleModal={() => this.toggleModal()}
                />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                        <View style={{ marginBottom: 20 }}>
                            <Rating
                                fractions={0}
                                ratingCount={5}
                                showRating={true}
                                startingValue={5}
                                onFinishRating={(value) => this.setState({ rating: value })} />
                        </View>
                        <View style={{ marginBottom: 5 }}>
                            <Input
                                placeholder='Author'
                                leftIconContainerStyle={{ marginRight: 6 }}
                                leftIcon={
                                    <Icon
                                        name='user-o'
                                        type='font-awesome'
                                    />
                                }
                                onChangeText={(value) => this.setState({ author: value })}
                            />
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <Input
                                placeholder='Comment'
                                leftIconContainerStyle={{ marginRight: 6 }}
                                leftIcon={
                                    <Icon
                                        name='comment-o'
                                        type='font-awesome'
                                    />
                                }
                                onChangeText={(value) => this.setState({ comment: value })}
                            />
                        </View>
                        <View style={{ marginBottom: 30 }}>
                            <Button
                                onPress={() => {
                                    this.addNewComment(dishId, this.state.rating, this.state.author, this.state.comment);
                                    this.resetForm();
                                }}
                                color="#512DA8"
                                title="SUBMIT"
                            />
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <Button
                                onPress={() => { this.toggleModal() }}
                                color="grey"
                                title="CANCEL"
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        margin: 20,
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);