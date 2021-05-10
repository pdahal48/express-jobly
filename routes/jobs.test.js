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
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /joba */

describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: 0.001,
        company_handle: "c2"
    };

  test("Able to add jobs by admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(201);

    expect(resp.body).toEqual({
        job: {
            id: expect.any(Number),
            title: 'new',
            salary: 100000,
            equity: "0.001",
            company_handle: 'c2'
        }
      });
  });
  
  test("NOT Able to add jobs by users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({ error: 
      { message: 'Unauthorized', status: 401 } });
  });

  
  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: 'TestProgammer',
            salary: 85000,
          })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
                title: 'TestProgammer',
                salary: .758,
                equity: 0.005,
                company_handle: 'c2'
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [{
        id: expect.any(Number),
        title: 'Software Developer',
        salary: 850000,
        equity: "0.005",
        company_handle: 'c1'
      },
      {
        id: expect.any(Number),
        title: 'Programmer',
        salary: 85000,
        equity: "0.005",
        company_handle: 'c2'
      },
      {
        id: expect.any(Number),
        title: 'Software Engineer',
        salary: 85000,
        equity: "0.005",
        company_handle: 'c3'
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

/************************************** GET /jobs/:id */

describe("GET /jobs/:title", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/Software`);
    expect(resp.body).toEqual({
      jobs: [{
        id: 1,
        title: 'Software Developer',
        salary: 850000,
        equity: "0.005",
        company_handle: 'c1'
      },
      {
        id: 3,
        title: 'Software Engineer',
        salary: 85000,
        equity: "0.005",
        company_handle: 'c3'
      }],
    });
  });

  test("works while using title query string", async function () {
    const resp = await request(app).get(`/jobs?title=software`);
    expect(resp.body).toEqual({
      jobs: [{
        id: 1,
        title: 'Software Developer',
        salary: 850000,
        equity: "0.005",
        company_handle: 'c1'
      },
      {
        id: 3,
        title: 'Software Engineer',
        salary: 85000,
        equity: "0.005",
        company_handle: 'c3'
      }],
    });
  });

  test("works while using title, minSalary, and hasEquity=true", async function () {
    const resp = await request(app).get(`/jobs?title=software&minSalary=95000&hasEquity=true`);
    expect(resp.body).toEqual({
      jobs: [{
        id: 1,
        title: 'Software Developer',
        salary: 850000,
        equity: "0.005",
        company_handle: 'c1'
      }],
    });
  });

  test("Returns no job found when no such job exists", async function () {
    const resp = await request(app).get(`/jobs/title=software&minSalary=100000`);
    expect(resp.body).toEqual({
      "error": {
        "message":"No such job found",
        "status": 404,
      },
    });
  });
  
  test("works while minSalary and hasEquity=true", async function () {
    const resp = await request(app).get(`/jobs?minSalary=100000&hasEquity=true`);
    expect(resp.body).toEqual({
      jobs: [{
        id: 1,
        title: 'Software Developer',
        salary: 850000,
        equity: "0.005",
        company_handle: 'c1'
      }],
    });
  });

  test("works while using title and minSalary query string", async function () {
    const resp = await request(app).get(`/jobs?titl=software&minSalary=100000`);
    expect(resp.body).toEqual({
      jobs: [{
        id: 1,
        title: 'Software Developer',
        salary: 850000,
        equity: "0.005",
        company_handle: 'c1'
      }],
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/doesnotexist`);
    expect(resp.statusCode).toEqual(404);
  });
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                   
/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/programmer`)
        .send({
          salary: 93000,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 2,
        title: "Programmer",
        salary: 93000,
        equity: "0.005",
        companyhandle: 'c2',
      },
    });
  });
})

  test("DOES NOT work for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/programmer`)
        .send({
          title: "Title-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ error: 
      { message: 'Unauthorized', status: 401 } });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/programmer`)
        .send({
          title: "Title-new",
        })
        expect(resp.statusCode).toEqual(401);
  });

  test("not found on database, no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/programmer`)
        .send({
          salary: "not-a-salary",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:title", function () {
  test("works for Admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/programmer`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "programmer" });
  });
  
  test("Does not work for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/programmer`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({"error": {
      "message": "Unauthorized",
      "status": 401}, });
    
  })
  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/programmer`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/doesnotexist`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
