"use strict";

const { Connection } = require("pg");
const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
 
   * */

  static async create({ title, salary, equity, company_handle }) {
      const result = await db.query(
        `INSERT INTO jobs
         (title, salary, equity, company_handle)
         VALUES ($1, $2, $3, $4) RETURNING id, title, salary, equity, company_handle
         `,
      [
        title, 
        salary, 
        equity, 
        company_handle
      ],
  );
    const job = result.rows[0]
    return job;   
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id,
                title, 
                salary, 
                equity, 
                company_handle
           FROM jobs
          `);
    return jobsRes.rows;
  }

  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title = '', minSalary=0, hasEquity='false') {

    let editedTitle = `%${title}%`
    if (hasEquity == 'true') {
      const jobsRes = await db.query(
        `SELECT id, title, salary, equity, company_handle
         FROM jobs 
         WHERE LOWER(title) LIKE LOWER($1) AND 
         salary > $2 and equity BETWEEN 0.0001 AND 1
         `, [editedTitle, minSalary]);
  
      const jobs = jobsRes.rows;
      if (jobs.length === 0) throw new NotFoundError(`No such job found`, 404);
      return jobs;
    }
      const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs 
       WHERE LOWER(title) LIKE LOWER($1) AND 
       salary > $2 and equity >= 0
       `, [editedTitle, minSalary]);

    const jobs = jobsRes.rows;
    if (jobs.length === 0) throw new NotFoundError(`No such job found`, 404);
    return jobs;
  }


  /** Update a job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE LOWER(title) LIKE LOWER(${handleVarIdx})
                      RETURNING id, title, salary, equity, company_handle as companyHandle`;

    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job found: ${title}`);

    return job;
  }

  /** Delete a given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE LOWER(title) LIKE LOWER($1)
           RETURNING title`,
        [title]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job found: ${title}`);
  }
}

module.exports = Job;
