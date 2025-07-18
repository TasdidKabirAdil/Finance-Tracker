const request = require('supertest')
const createApp = require('../server')

describe("User Graphql Query/Mutation", () => {
    let app;

    beforeAll(async () => {
        app = await createApp();
    });

    it("fetches user info", async () => {
        const query = `
        query User($userId: ID!) {
            user(id: $userId) {
                id
                name
                email
            }
        }
        `

        const response = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: { userId: "6871e21e774631cc34075c75" }
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.user).toHaveProperty('email')
    })

    it("user login", async () => {
        const query = `
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    user {
                        name
                    }
                }
            }
        `

        const response = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    email: "demo@kaneflow.com",
                    password: "demo1234"
                }
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.login.user.name).toEqual('KaneFlow Demo')
    })

    let userId

    it("user registration", async () => {
        const query = `
            mutation Register($name: String!, $email: String!, $password: String!, $estimatedMonthlyIncome: Float!, $currency: String) {
                register(name: $name, email: $email, password: $password, estimatedMonthlyIncome: $estimatedMonthlyIncome, currency: $currency) {
                    id
                    name
                    verified
                    verificationToken
                }
            }
        `

        const response = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    name: 'test acc',
                    email: "test@account.com",
                    password: "test",
                    estimatedMonthlyIncome: 100,
                    currency: 'CAD'
                }
            })


        expect(response.statusCode).toBe(200)
        userId = response.body.data.register.id
        expect(response.body.data.register.name).not.toBeNull()
        expect(response.body.data.register.verified).toBe(false)

    })

    it("updates the user profile", async () => {
        const query = `
        mutation UpdateProfile($id: ID!, $name: String!, $estimatedMonthlyIncome: Float!, $address: String, $country: String, $currency: String) {
            updateProfile(id: $id, name: $name, estimatedMonthlyIncome: $estimatedMonthlyIncome, address: $address, country: $country, currency: $currency) {
                id
                name
                estimatedMonthlyIncome
                address
                country
                currency
                updatedAt
            }
        }
    `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: {
                id: userId,
                name: 'Updated Name',
                estimatedMonthlyIncome: 3000,
                address: '123 Main St',
                country: 'Canada',
                currency: 'CAD'
            }
        });

        expect(res.statusCode).toBe(200);
        const updated = res.body.data.updateProfile;
        expect(updated.name).toBe('Updated Name');
        expect(updated.address).toBe('123 Main St');
        expect(updated.country).toBe('Canada');
        expect(updated.currency).toBe('CAD');
    });

    it("deletes the user", async () => {
        const query = `
            mutation DeleteUser($id: ID!) {
                deleteUser(id: $id)
            }
        `;

        const res = await request(app).post('/graphql').send({
            query,
            variables: { id: userId }
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.deleteUser).toBe(true);
    });


})