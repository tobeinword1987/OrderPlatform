describe('AppController (e2e)', () => {
  it('/ (GET)', async () => {
    const res = await fetch('http:/localhost:3000/');
    expect(res.status).toBe(200);
    const message = await res.json();
    expect(message).toEqual({ msg: 'Ecommerce Order Platform' });
  });
});
