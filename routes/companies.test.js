"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("Able to add users by admin", async function () {
    const resp = await request(app)
        .post("/companies")
        .send(newCompany)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });
  
  test("NOT Able to add users by users", async function () {
    const resp = await request(app)
        .post("/companies")
        .send(newCompany)
        .set("authorization", `Bearer ${u1Token}`);
    console.log(resp.body)
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({ error: 
      { message: 'Unauthorized', status: 401 } });
  });

  
  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          ...newCompany,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [{
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    },
    {
      handle: "c2",
      name: "C2",
      description: "Desc2",
      numEmployees: 2,
      logoUrl: "http://c2.img",
    },
    {
      handle: "c3",
      name: "C3",
      description: "Desc3",
      numEmployees: 3,
      logoUrl: "http://c3.img",
    },
    {
      handle: "c35",
      name: "C35",
      numEmployees: 30,
      description: "description of test user c35",
      logoUrl: "http://c35.img",
    },
    {
      handle: "c70",
      name: "C70",
      numEmployees: 15,
      description: "Test C70",
      logoUrl: "http://c70.img",
      }],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/C1`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        jobs: [{
          id: expect.any(Number),
          title: 'Software Developer',
          salary: 850000,
          equity: "0.005",
        }]
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/C2`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: [{
          id: expect.any(Number),
          title: 'Programmer',
          salary: 85000,
          equity: "0.005",
        }]
      },
    });
  });

  test("works for incomplete company names", async function () {
    const resp = await request(app).get(`/companies/2`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: [{
          id: expect.any(Number),
          title: 'Programmer',
          salary: 85000,
          equity: "0.005",
        }]
      },
    });
  });

  test("works while using name query string", async function () {
    const resp = await request(app).get(`/companies?name=C2`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: [{
          id: expect.any(Number),
          title: 'Programmer',
          salary: 85000,
          equity: "0.005",
        }]
      },
    });
  });

  test("works while using name, min, and max query string", async function () {
    const resp = await request(app).get(`/companies?name=C70&minEmployees=10&maxEmployees=20`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c70",
        name: "C70",
        numEmployees: 15,
        description: "Test C70",
        logoUrl: "http://c70.img",
        jobs: []
      },
    });
  });
  
  test("works while min and max query string", async function () {
    const resp = await request(app).get(`/companies?minEmployees=25&maxEmployees=100`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c35",
        name: "C35",
        numEmployees: 30,
        description: "description of test user c35",
        logoUrl: "http://c35.img",
        jobs: []
      },

    });
  });

  test("works while using name and max query string", async function () {
    const resp = await request(app).get(`/companies?name=c&maxEmployees=5`);
    expect(resp.body).toEqual({
      companies: {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
        jobs:[{
          id: expect.any(Number),
          title: 'Software Developer',
          salary: 850000,
          equity: "0.005",
        }]
      },
    });
  });


  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });

})

// /************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("DOES NOT work for users", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ error: 
      { message: 'Unauthorized', status: 401 } });
  });


  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        })
        expect(resp.statusCode).toEqual(401);
  });

  test("not found on database, no such company", async function () {
    const resp = await request(app)
        .patch(`/companies/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${u2Token}`);
        // console.log(resp)
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          handle: "c1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
// });
})

// /************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for Admins", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });
  
  test("Does not work for users", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({"error": {
      "message": "Unauthorized",
      "status": 401}, });
    
  })
  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
