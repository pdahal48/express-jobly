

"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: 0.001,
    company_handle: "c2"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: job.id,
      title: "new",
      salary: 100000,
      equity: "0.001",
      company_handle: "c2"
    });

  // const result = await db.query(
  //   `SELECT id, title, salary, equity, company_handle
  //     FROM jobs
  //     WHERE id = $1`, [job.id]);

  // expect(result.rows).toEqual([
  //   {
  //     id: job.id,
  //     title: "new",
  //     salary: 100000,
  //     equity: "0.001",
  //     company_handle: 'c2'
  //   },
  // ]);
})

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J1",
        salary: 10000,
        equity: "0",
        company_handle: 'c1',
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 100000,
        equity: "0.105",
        company_handle: 'c2',
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 50000,
        equity: "0.0045",
        company_handle: 'c3',
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual([{
      id: 1,
      title: "J1",
      salary: 10000,
      equity: "0",
      company_handle: 'c1',
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("150000");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "J7",
  };

  test("works", async function () {
    let job = await Job.update('J1', updateData);
    expect(job).toEqual({
      id: 1,
      title: "J7",
      salary: 10000,
      equity: "0",
      companyhandle: "c1"
      
    });
  })
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: 5,
      equity: .7,
    };

    let job = await Job.update('J1', updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      title: "New",
      salary: 5,
      equity: "0.7",
      companyhandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id = 1`);
   expect(job).toEqual({
      id: 1,
      title: "New",
      salary: 5,
      equity: "0.7",
      companyhandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      const updateData = {
        title: "New",
        salary: 5,
        equity: .7,
      };

      await Job.update('None', updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove('J1');
    const res = await db.query(
        `SELECT title 
        FROM jobs 
        WHERE LOWER(title) LIKE $1`, ["J1"]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove('None');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
