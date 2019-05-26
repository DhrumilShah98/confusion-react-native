import React from 'react';
import { Text, ScrollView } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import { MailComposer } from 'expo';

function RenderContactDetails() {


    const sendMail = () => {
        MailComposer.composeAsync({
            recipients: ['confusion@food.net'],
            subject: 'Enquiry',
            body: 'To whom it may concern:',
        });
    }

    const contactTitle = 'Contact Information';
    const contactInfo = '121, Clear Water Bay Road\n\nClear Water Bay, Kowloon\n\nHONG KONG\n\nTel: +852 1234 5678\n\nFax: +852 8765 4321\n\nEmail:confusion@food.net';
    return (
        <ScrollView>
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
                <Card
                    title={contactTitle}>
                    <Text style={{ margin: 10 }}>
                        {contactInfo}
                    </Text>
                    <Button
                        title=' Send Email'
                        buttonStyle={{ backgroundColor: '#512DA8' }}
                        icon={<Icon name='envelope-o' type='font-awesome' color='white' />}
                        onPress={() => sendMail()}
                    />
                </Card>
            </Animatable.View>
        </ScrollView >
    );
}

export default RenderContactDetails;