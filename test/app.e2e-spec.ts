const url = process.env['INTEGRATION_TESTS_URL'] || 'http://localhost:3000/'

describe('AppController (e2e)', () => {
  it('/ (GET)', async () => {
    const res = await fetch(`${url}/`);
    expect(res.status).toBe(200);
    const message = await res.json();
    expect(message).toEqual({ msg: 'Ecommerce Order Platform' });
  }, 60*1000);
});
