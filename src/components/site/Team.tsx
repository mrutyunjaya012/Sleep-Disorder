import { Github, Linkedin } from "lucide-react";

const people = [
  {
    n: "Mrutyunjaya Beura",
    r: "Principal Investigator",
    a: "School of Computer application",
    img: "src/assets/MY_PIC.JPG",
  },
  {
    n: "Aman Deep",
    r: "ML Researcher",
    a: "School of Computer application",
    img: "src/assets/aman.jpeg",
  },
  {
    n: "Subhalaxmi Chaudhury",
    r: "Web Developer",
    a: "School of Computer application",
    img: "src/assets/subhlaxmi.JPG",
  },
  {
    n: "Satyam Pal",
    r: "Data Scientist",
    a: "School of Computer application",
    img: "src/assets/satyam.jpg",
  },
  {
    n: "Jyotirmayee Samal",
    r: "Data Scientist",
    a: "School of Computer application",
    img: "src/assets/jyotirmayee.JPG",
  },
];

export function Team() {
  return (
    <section
  id="team"
  className="py-24 bg-white"
>
  <div className="mx-auto max-w-7xl px-4">
    
    {/* Heading */}
    <div className="text-center mb-16">
      <p className="text-sm font-semibold tracking-widest uppercase text-cyan-600 mb-3">
        Our Authors
      </p>

      <h2 className="text-4xl md:text-6xl font-bold text-slate-900">
        Meet The Research Team
      </h2>

      <p className="mt-5 text-slate-600 max-w-2xl mx-auto text-lg">
        A passionate interdisciplinary team working on AI, machine learning,
        behavioral analytics, and health informatics research.
      </p>
    </div>

    {/* Cards */}
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-2xl"
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition duration-500" />

          {/* Profile Image */}
          <div className="relative flex justify-center z-10">
            <div className="p-[3px] rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
              <img
                src={p.img}
                alt={p.n}
                className="w-28 h-28 rounded-full object-cover border-4 border-white"
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center relative z-10">
            <h3 className="text-2xl font-semibold text-slate-900">
              {p.n}
            </h3>

            <p className="text-cyan-600 font-medium mt-2">
              {p.r}
            </p>

            <p className="text-slate-500 text-sm mt-2">
              {p.a}
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex justify-center gap-4">
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:bg-purple-500 hover:text-white hover:scale-110"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}